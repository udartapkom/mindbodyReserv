"use client";
import { useState } from "react";
import UniversalInput from "@/shared/ui/UniversalInput/UniversalInput";

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div>
            <UniversalInput 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <UniversalInput 
                type="password" 
                placeholder="Password" 
                value={password} onChange={(e) => setPassword(e.target.value)} />
            <button>Login</button>
        </div>
    );
}

export default LoginForm;