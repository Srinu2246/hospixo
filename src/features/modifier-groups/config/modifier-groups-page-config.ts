export type ModifierGroupsPageConfig = Readonly<{
  pageTitle: string;
  pageSubtitle: string;
  homeHref: string;
}>;

export const companyModifierGroupsPageConfig: ModifierGroupsPageConfig = {
  pageTitle: 'Modifier Groups',
  pageSubtitle: 'Manage customizations, toppings, and add-ons applied to menu items.',
  homeHref: '/company',
};

export const branchModifierGroupsPageConfig: ModifierGroupsPageConfig = {
  pageTitle: 'Modifier Groups',
  pageSubtitle: 'Company modifier groups inherited for this branch. Changes apply company-wide.',
  homeHref: '/branch',
};
