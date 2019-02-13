import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);
const db = admin.database();

export const helloWorld = functions.https.onRequest((request, response) => {
  return response.send("Hello from Firebase!");
});

export const newGame = functions.database.ref('/games/{game}/gameInfo/isNew')
  .onCreate(async (snapshot: functions.database.DataSnapshot, context: functions.EventContext): Promise<any> => {
    if (!snapshot.val()) {
      return null;
    }

    const words = ['hello', 'sausage', 'walking', 'boobs'];
    const randomIndex = getRandomInt(0, words.length - 1);
    const randomWord = words[randomIndex];

    const shadowedLetters: string[][] = randomWord.split(' ').map((word: string) => [...word].map((_: string) => ' '));
    const correctLetters: string[][] = randomWord.split(' ').map((word: string) => [...word]);

    await db.ref(`/games/${context.params.game}/gameInfo`).update({
      isNew: false,
      letterWord: shadowedLetters
    });

    const ref = db.ref(`/games/${context.params.game}/secretInfo`);
    return ref.update({
      word: randomWord,
      letterWord: correctLetters
    });

  });

export const submitLetter = functions.https.onCall(async (data: any, _: functions.https.CallableContext): Promise<any> => {
  if (!(data.letter && data.gameId)) return {error: 'letter and gameId not sent.'};

  const letter = data.letter;
  const gameId = data.gameId;

  const secretRef = db.ref(`/games/${gameId}/secretInfo`);
  await secretRef.on('value', async (secretInfo: admin.database.DataSnapshot | null) => {
    if (secretInfo === null || !secretInfo.exists()) {console.log('null'); return;}
    let usedLetters: string[] = [];
    let correctLetters: string[] = [];
    let letterWord: string[][] = [[]];

    const gameInfoRef = db.ref(`/games/${gameId}/gameInfo`);
    await gameInfoRef.on('value', async (gameInfo: admin.database.DataSnapshot | null) => {
      if (gameInfo === null || !gameInfo.exists()) {console.log('null'); return;}

      if (gameInfo.child('letters').child('incorrect').exists()) {
        usedLetters = gameInfo.child('letters').child('incorrect').val();
      }
      if (gameInfo.child('letters').child('correct').exists()) {
        correctLetters = gameInfo.child('letters').child('correct').val();
      }
      if (gameInfo.child('letterWord').exists()) {
        letterWord = gameInfo.child('letterWord').val();
      }

      if (usedLetters.findIndex(element => element === letter) !== -1 ||
        correctLetters.findIndex(element => element === letter) !== -1) {
        return {message: 'This letter has already been chosen'};
      }

      const words: string[] = secretInfo.child('word').val().split(' ');
      words.forEach((word: string, i: any) => {
        const letterIndex: number = [...word].findIndex((currentLetter: string) => currentLetter === letter);
        if (letterIndex === -1) {
          if (usedLetters.findIndex((usedLetter: string) => usedLetter === letter) === -1) {
            usedLetters.push(letter);
          }
        } else {
          letterWord[i][letterIndex] = letter;
          correctLetters.push(letter);
        }
      });

      await gameInfoRef.update({
        letters: {
          incorrect: usedLetters,
          correct: correctLetters
        },
        letterWord
      });
      return {message: 'updated!'};
    }, (error: any) => {return error});

  }, (error: any) => {return error});
});

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

