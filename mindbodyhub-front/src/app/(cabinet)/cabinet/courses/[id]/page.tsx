'use client';

import { useParams } from 'next/navigation';

export default function CabinetCoursePage() {
    const { id } = useParams<{ id: string }>();

    return (
        <section>
            <h1>Курс</h1>
            <p>Страница курса: {id}</p>
        </section>
    );
}
