Beta 1.0: Flashcard content
- Sets can now hold real cards: Term & Definition, Math, and Code (new cardSchema/cards field in dao/SetsDaoMongoose.js)
- Math cards are checked by evaluating the typed answer as an expression (new mathjs dependency), not just matching a plain number
- Code cards are actual fill-in-the-blank Java: the creator's template + correct answer gets compiled and run server-side when the card is saved (new services/javaRunner.js), and the expected output is captured automatically instead of typed by hand
- Create Set has an Add Card button; Edit Set now manages cards too (shared the card-editing UI between both pages via public/js/cardEditor.js)
- Added a Study page (studyset.html) to go through a set's cards, reachable by clicking a set on the Home Page or My Sets/Browse Sets
- Study mode tracks progress: mark term/definition cards right or wrong yourself, math/code cards get checked automatically, and anything wrong keeps cycling back until you get it right
- Added a Shuffle button and a "Close Enough" option (if you get a fill-in-the-blank question wrong then right before moving on, you can count it as complete or leave it flagged incomplete for next time)
- Tests for the new Java runner service




Alpha 1.0: Profile addition
- Added user accounts with register/login/logout (new dao/UsersDaoMongoose.js, controllers/authController.js, sessions via express-session/connect-mongo, passwords hashed with bcryptjs)
- Guests can still browse everyone's sets, but only logged in users can create their own (added an owner field to sets, ownership checked in the controller before update/delete)
- My Sets page now shows only your own sets when logged in, and everyone's sets (view only, no edit/delete) when browsing as a guest
- Added a Profile page with tabs for Personal Info, Appearance (theme picker coming later), and Account & Privacy
- Added a Change Password page and a Delete Account option
- Renamed "Welcome Page" to "Home Page" in the navbar
- Tests for the new Users Dao




ChangeLog for Assignment #5
- Added support for MongoDB/Mongoose (changes in server.js, added app.js, new dao, edited controller, .env, DbConnection.js)
- Set IDs for mongoose work differently so to keep coninuity I kept the ID field in "My sets" the same even though the IDS are now messy and long
- Tests for the new Mongoose Dao




ChangeLog for Assignment #4
-Added a DAO controller and adjusted the DAO and server files to fit with it
-Added front end integration with this new system
  -There is now a my sets page that has all the users created sets (the same sets that also shows in most recent setlist but with more data)
    -Each set can be edited or deleted
      -A new edit set page that is the same as the createset page but will start off with the information that was already there
-Tests for the DAO



ChangeLog for Assignment #3
- Made a static server for the web application
- Added data.json that has a list of flashcard sets
- Most recent setlist will list all of the flash cards stored in data.json if the user presses show more


ChangeLog for Assignment #2 
- Made the welcome page look nicer by changing the color scheme like asked too and using cards to format everything
- Added a JS Dom and an About us card to go with it. 
- Made a form for creating a flashcard set that can be accessed from the navbar or the image on the welcome page
- Added welcome page to the navbar
- Changed styles.css color sheet
  



# Web-Programming-RegiQuiz-Web-Application
I want to put coding questions into Quizlet to review for midterms and quizzes, but quizlet just sucks at it. Sometimes I want to go through flashcards but it might be a math problem or rewriting code, or a  multi part question. This code will allow me to do all of it in one flashcard set
