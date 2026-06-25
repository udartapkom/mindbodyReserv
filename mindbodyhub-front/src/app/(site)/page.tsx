import styles from "./page.module.scss";
import TitleAnimate from "@/components/TitleAnimate/TitleAnimate";
import MainText from "@/components/MainText/MainText";
import PriceSection from "@/components/PriceSection/PriceSection";
import We from "@/components/We/We";
import AttentionSection from "@/components/AttentionSection/AttentionSection";
import QuestionForm from "@/components/QuestionForm/QuestionForm";

export default function Home() {
  return (
    <>
      <TitleAnimate />
      <MainText />
      <PriceSection />
      <AttentionSection />
      <We />
      <QuestionForm />
    </>
  );
}
