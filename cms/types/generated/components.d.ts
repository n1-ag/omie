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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'menu.menu-item': MenuMenuItem;
      'menu.menu-item-child': MenuMenuItemChild;
    }
  }
}
