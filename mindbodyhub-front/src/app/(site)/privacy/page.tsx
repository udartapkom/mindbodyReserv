"use client";

import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "@/api/api";

function PrivacyPage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);


    useEffect(() => {
        getHealth().then((data) => {
            console.log(data);
            setHealth(data);
        });
    }, []);
    return (
        <div>
            <h1>Бэк работает: {health?.status}</h1>
        </div>
    );
}

export default PrivacyPage;