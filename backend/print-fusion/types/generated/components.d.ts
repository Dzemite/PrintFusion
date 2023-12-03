import type { Schema, Attribute } from '@strapi/strapi';

export interface SettingsUserSettings extends Schema.Component {
  collectionName: 'components_settings_user_settings';
  info: {
    displayName: 'user-settings';
    icon: 'puzzle';
  };
  attributes: {
    Units: Attribute.Enumeration<['\u043A\u0433.', '\u0433.']> &
      Attribute.Required &
      Attribute.DefaultTo<'\u043A\u0433.'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'settings.user-settings': SettingsUserSettings;
    }
  }
}
