export type GstRatesPageConfig = Readonly<{
  pageTitle: string;
  pageSubtitle: string;
  homeHref: string;
}>;

export const companyGstRatesPageConfig: GstRatesPageConfig = {
  pageTitle: 'GST Rates',
  pageSubtitle: 'Configure GST slabs used across menu items and billing.',
  homeHref: '/company',
};

export const branchGstRatesPageConfig: GstRatesPageConfig = {
  pageTitle: 'GST Rates',
  pageSubtitle: 'Company GST slabs inherited for this branch. Changes apply company-wide.',
  homeHref: '/branch',
};
