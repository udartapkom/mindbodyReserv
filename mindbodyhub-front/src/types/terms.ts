export type TermsSection = {
  title: string;
  content: string[];
};

export type Terms = {
  date: string;
  sections: TermsSection[];
};
