import type { Schema, Attribute } from '@strapi/strapi';

export interface SettingsUserSettings extends Schema.Component {
  collectionName: 'components_settings_user_settings';
  info: {
    displayName: 'user-settings';
    icon: 'puzzle';
    description: '';
  };
  attributes: {};
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'settings.user-settings': SettingsUserSettings;
    }
  }
}
