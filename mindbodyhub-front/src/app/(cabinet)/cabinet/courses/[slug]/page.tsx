import type { Metadata } from 'next';
import CoursePageContent from './CoursePageContent';

type CabinetCoursePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CabinetCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Курс — ${slug}`,
  };
}

export default async function CabinetCoursePage({ params }: CabinetCoursePageProps) {
  const { slug } = await params;
  return <CoursePageContent slug={slug} />;
}
