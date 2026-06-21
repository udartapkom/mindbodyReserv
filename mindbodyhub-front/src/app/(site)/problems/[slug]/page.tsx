"use client";
import { problems } from "@/content/problems";
import { useParams } from "next/navigation";
import { problem } from "@/types/problem";

function ProblemsPage() {

    const { slug } = useParams();
    const problem = problems.find((problem: problem) => problem.slug === slug);
    if (!problem) {
        return <div>Нет проблем</div>;
    }
    
    return (
        <div>
            <h1>{problem.title}</h1>
            <p>{problem.description}</p>
        </div>
    );
}

export default ProblemsPage;
