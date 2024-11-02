import type { UmbPropertyEditorConfig } from '@umbraco-cms/backoffice/property-editor';

export interface MyDropdownEditorConfiguration extends UmbPropertyEditorConfig {
    items: Array<{
        key: string;
        value: string;
    }>;
    multiple: boolean;
    defaultValue?: string;
} 