"use client";
import { useEffect, useState } from "react";
import { politics } from "@/content/politics";
import styles from "./page.module.scss";
import Link from "next/link";

function PrivacyPage() {

    return (
        <main className={styles.politics}>
            <Link href="/">Главная</Link>
            <h1>Политика конфиденциальности</h1>
            <p>Дата последнего обновления: {politics.date}</p>
            <p>Внимание! Данная политика конфиденциальности действует только для сервиса https://mindbodyhub.pro/</p>
            <p>Политика конфиденциальности регулирует сбор, использование и защиту информации пользователей сервиса. 
                Собираются идентификаторы аккаунта, техническая информация и история взаимодействий. 
                Данные используются для обеспечения работы сервиса, связи с пользователем и анализа. 
                Передача информации третьим лицам возможна только в законодательно установленных случаях или с согласия пользователя. 
                Хранение данных осуществляется в течение необходимого срока, их защита — в разумных пределах. 
                Пользователь самостоятельно несёт ответственность за риски, связанные с передачей данных. 
                Администрация вправе вносить изменения в Политику без уведомления — согласие считается принятым при дальнейшем использовании сервиса.</p>
            <div className="flex flex-col gap-4">
            {politics.sections.map((section) => (
                    <div key={section.title}>
                        <h2>{section.title}</h2>
                        {section.content.map((paragraph, index) => (
                            <p key={`${section.title}-${index}`}>{paragraph}</p>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}

export default PrivacyPage;