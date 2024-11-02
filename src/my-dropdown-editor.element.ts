import { customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUISelectEvent } from '@umbraco-cms/backoffice/external/uui';

interface Option {
    name: string;
    value: string;
    selected?: boolean;
}

@customElement('my-dropdown-editor')
export class MyDropdownEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property()
    value?: string = '';

    @state()
    private _options: Array<Option> = [];

    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        if (!config) return;

        const items = config.getValueByAlias('items');
        const defaultIndex = parseInt(config.getValueByAlias('defaultValue') as string) || 0;

        if (Array.isArray(items) && items.length > 0) {
            // If no value is set, use the default index
            const effectiveValue = this.value || items[defaultIndex];
            
            this._options = items.map((item) => ({
                name: item,
                value: item,
                selected: item === effectiveValue
            }));
        }
    }

    #onChange(event: UUISelectEvent) {
        this.value = event.target.value as string;
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    render() {
        return html`
            <uui-select 
                .options=${this._options} 
                @change=${this.#onChange}>
            </uui-select>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'my-dropdown-editor': MyDropdownEditorElement;
    }
} 