import type { Schema, Struct } from '@strapi/strapi';

export interface MenuMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_menu_items';
  info: {
    description: 'Item de navega\u00E7\u00E3o (label + URL). Pode ter subitens em um n\u00EDvel.';
    displayName: 'Item do menu';
    icon: 'bulletList';
  };
  attributes: {
    children: Schema.Attribute.Component<'menu.menu-item-child', true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'/'>;
  };
}

export interface MenuMenuItemChild extends Struct.ComponentSchema {
  collectionName: 'components_menu_menu_item_children';
  info: {
    description: 'Subitem (um n\u00EDvel abaixo do item principal).';
    displayName: 'Subitem do menu';
    icon: 'arrowRight';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'/'>;
  };
}

export interface SharedOrganizationStructuredData
  extends Struct.ComponentSchema {
  collectionName: 'components_shared_organization_structured_data';
  info: {
    description: 'JSON para schema.org Organization (name, url, sameAs). Usado em JSON-LD.';
    displayName: 'Dados estruturados \u2014 Organization';
    icon: 'file';
  };
  attributes: {
    organizationJson: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<{
        name: 'Omie';
        sameAs: [
          'https://www.linkedin.com/company/omie',
          'https://www.facebook.com/omieoficial',
          'https://www.instagram.com/omieoficial',
          'https://www.youtube.com/user/omiexperience',
          'https://blog.omie.com.br',
        ];
        url: 'https://www.omie.com.br/';
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Campos de SEO por p\u00E1gina/post (title, description, canonical, noindex)';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<''>;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }> &
      Schema.Attribute.DefaultTo<''>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }> &
      Schema.Attribute.DefaultTo<''>;
    noindex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'menu.menu-item': MenuMenuItem;
      'menu.menu-item-child': MenuMenuItemChild;
      'shared.organization-structured-data': SharedOrganizationStructuredData;
      'shared.seo': SharedSeo;
    }
  }
}
