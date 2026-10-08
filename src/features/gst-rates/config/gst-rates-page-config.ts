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
