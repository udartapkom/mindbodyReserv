import TitleAnimate from "@/components/TitleAnimate/TitleAnimate";
import MainText from "@/components/MainText/MainText";
import HomeHelpTopics from "@/components/HomeHelpTopics/HomeHelpTopics";
import HomeSolutionsPreview from "@/components/HomeSolutionsPreview/HomeSolutionsPreview";
import HomeHowItWorks from "@/components/HomeHowItWorks/HomeHowItWorks";
import PriceSection from "@/components/PriceSection/PriceSection";
import AttentionSection from "@/components/AttentionSection/AttentionSection";
import HomeKnowledgePreview from "@/components/HomeKnowledgePreview/HomeKnowledgePreview";
import HomeFaq from "@/components/HomeFaq/HomeFaq";
import We from "@/components/We/We";
import QuestionForm from "@/components/QuestionForm/QuestionForm";
import { knowledge as knowledgeApi, problems } from "@/api/api";
import { FREE_ACCESS_TYPE } from "@/types/material";

/** Fresh enough for new free materials / knowledge without full dynamic SSR every hit. */
export const revalidate = 60;

async function getFreeMaterials() {
  try {
    return await problems.getProblems(FREE_ACCESS_TYPE);
  } catch {
    return [];
  }
}

async function getArticles() {
  try {
    return await knowledgeApi.getArticles();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [materials, articles] = await Promise.all([
    getFreeMaterials(),
    getArticles(),
  ]);

  return (
    <>
      <TitleAnimate />
      <MainText />
      <HomeHelpTopics />
      <HomeSolutionsPreview materials={materials} />
      <HomeHowItWorks />
      <PriceSection />
      <AttentionSection />
      <HomeKnowledgePreview articles={articles} />
      <HomeFaq />
      <We />
      <QuestionForm />
    </>
  );
}
