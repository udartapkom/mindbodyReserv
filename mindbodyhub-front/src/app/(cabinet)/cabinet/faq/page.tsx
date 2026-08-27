import { redirect } from 'next/navigation';

/** Legacy FAQ stub — replaced by Insights. */
export default function CabinetFaqPage() {
  redirect('/cabinet/insights');
}
