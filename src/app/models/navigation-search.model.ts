/** Searchable application destination owned by the shell. */
export type NavigationSearchDestination = {
  id: string;
  label: string;
  description: string;
  icon: string;
  path: string;
  keywords: string[];
};
