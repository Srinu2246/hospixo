export type PreparationStationsPageConfig = Readonly<{
  pageTitle: string;
  pageSubtitle: string;
  homeHref: string;
}>;

export const companyPreparationStationsPageConfig: PreparationStationsPageConfig = {
  pageTitle: 'Preparation Stations',
  pageSubtitle: 'Configure kitchen prep stations used for routing menu items and KOT tickets.',
  homeHref: '/company',
};
