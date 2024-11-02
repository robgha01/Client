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
    @property({ type: Array })
    public value: Array<string> = [];

    @state()
    private _options: Array<Option> = [];

    connectedCallback() {
        super.connectedCallback();
        console.log('Connected - Initial value:', this.value);
    }

    public setValue(value: Array<string>): void {
        console.log('setValue called with:', value);
        this.value = value;
        this.#updateOptionsSelection();
    }

    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        console.log('Config setter - Current value:', this.value);
        if (!this.value) {
            console.log('No value, setting to empty array');
            this.value = [];
        }
        
        if (!config) return;
    
        const items = config.getValueByAlias('items');
        const defaultIndex = parseInt(config.getValueByAlias('defaultValue') as string) || 0;
    
        if (Array.isArray(items) && items.length > 0) {
            this._options = items.map((item) => ({
                name: item,
                value: item,
                selected: this.value.includes(item)
            }));
    
            // Only set default if we don't have a value
            if ((!this.value || this.value.length === 0) && items[defaultIndex]) {
                console.log('Setting default value:', [items[defaultIndex]]);
                this.setValue([items[defaultIndex]]);
            }
        }
    }

    #updateOptionsSelection() {
        this._options = this._options.map(option => ({
            ...option,
            selected: this.value.includes(option.value)
        }));
    }

    #onChange(event: UUISelectEvent) {
        const newValue = event.target.value as string;
        this.value = [newValue];
        this.#updateOptionsSelection();
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    render() {
        return html`
            <uui-select 
                .options=${this._options} 
                .value=${this.value[0] || ''}
                @change=${this.#onChange}>
            </uui-select>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'my-dropdown-editor': MyDropdownEditorElement;
    }
} 