import React, { useRef, useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCsQ8hlIO4SLmN5k_D-9W9W8GG0gFCy1hI",
  authDomain: "tell-u-1234.firebaseapp.com",
  projectId: "tell-u-1234",
  storageBucket: "tell-u-1234.appspot.com",
  messagingSenderId: "305765764044",
  appId: "1:305765764044:web:470e73c4a53385ff026b69",
  measurementId: "G-1RX3TX17NC"
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <h1>💌 tell-u</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}

function SignOut() {
  const handleSignOut = () => auth.signOut();
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={handleSignOut}><FontAwesomeIcon icon={faRightFromBracket} /></button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => setFormValue(e.target.value);

  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.key} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={handleInputChange} />
        <button>🕊️</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User" />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
