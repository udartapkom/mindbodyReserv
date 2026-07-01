"use client";
import { useState } from "react";
import { PatternFormat } from "react-number-format";
import styles from "./LoginForm.module.scss";

function LoginForm() {
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(telephone, password);
    };

    return (
        <div className={styles.LoginForm}>
            <form className={styles.LoginForm__form} onSubmit={handleSubmit}>
                <PatternFormat
                    className={styles.LoginForm__input}
                    id="telephone"
                    name="telephone"
                    format="+7 (###) ###-##-##"
                    mask="_"
                    placeholder="+7 (___) ___-__-__"
                    value={telephone} 
                    onChange={(e) => setTelephone(e.target.value)} 
                />                <input 
                    className={styles.LoginForm__input}
                    type="password" 
                    placeholder="Password" 
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className={styles.LoginForm__button}>Login</button>
            </form>

        </div>
    );
}

export default LoginForm;