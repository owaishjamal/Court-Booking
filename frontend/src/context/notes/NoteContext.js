// NoteContext.js

import React, { createContext, useState } from "react";

export const NoteContext = createContext();

export function NoteProvider(props) {
    const HOST = process.env.REACT_APP_API_URL;
    const initialNotes = [];

    const [notes, setNotes] = useState(initialNotes);

    const getNotes = async () => {
        try {
            const response = await fetch(`${HOST}/api/notes/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
            });
            const json = await response.json();
            setNotes(json);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]); // Set empty array or handle error state
        }
    };

    const add = async (newNote) => {
        try {
            const response = await fetch(`${HOST}/api/notes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(newNote)
            });
            const json = await response.json();
            setNotes([...notes, json]);
        } catch (error) {
            console.error("Error adding note:", error);
            throw new Error("Failed to add note");
        }
    };

    const remove = async (removeId) => {
        try {
            const response = await fetch(`${HOST}/api/notes/${removeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
            });
            const json = await response.json();
            setNotes(notes.filter(note => note._id !== removeId));
            console.log(json);
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new Error("Failed to delete note");
        }
    };

    const edit = async (title, description, tag, editId) => {
        try {
            const response = await fetch(`${HOST}/api/notes/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ title, description, tag })
            });
            const json = await response.json();
            const updatedNotes = notes.map(note => {
                if (note._id === editId) {
                    return { ...note, title, description, tag };
                }
                return note;
            });
            setNotes(updatedNotes);
            console.log(json);
        } catch (error) {
            console.error("Error editing note:", error);
            throw new Error("Failed to edit note");
        }
    };

    return (
        <NoteContext.Provider value={{ notes, getNotes, add, remove, edit }}>
            {props.children}
        </NoteContext.Provider>
    );
}
