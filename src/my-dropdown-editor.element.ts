import { customElement, html, property, state, css } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUISelectEvent } from '@umbraco-cms/backoffice/external/uui';
import { map } from '@umbraco-cms/backoffice/external/lit';

interface KeyValueItem {
    key: string;
    value: string;
    isDefault?: boolean;
}

interface Option {
    name: string;
    value: string;
    selected?: boolean;
}

@customElement('my-dropdown-editor')
export class MyDropdownEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value: Array<string> = [];

    @property({ type: Boolean })
    public readonly = false;

    @state()
    private _options: Array<Option> = [];

    @state()
    private _isMultiple = false;

    public set config(config: UmbPropertyEditorConfigCollection | undefined) {
        console.log('Config setter - Current value:', this.value);
        
        if (!this.value) {
            this.value = [];
        }
        
        if (!config) return;

        const testValue = config.getValueByAlias('testValue') as Array<KeyValueItem>;
        this._isMultiple = config.getValueByAlias('multiple') ?? false;

        if (Array.isArray(testValue) && testValue.length > 0) {
            this._options = testValue.map((item) => ({
                name: item.key,
                value: item.value,
                selected: this.value.includes(item.value)
            }));

            // Set default value if one is marked as default
            const defaultItem = testValue.find(item => item.isDefault);
            if ((!this.value || this.value.length === 0) && defaultItem) {
                console.log('Setting default value:', [defaultItem.value]);
                this.setValue([defaultItem.value]);
            }
        }
    }

    public setValue(value: Array<string>): void {
        console.log('setValue called with:', value);
        this.value = value;
        this.#updateOptionsSelection();
    }

    #updateOptionsSelection() {
        this._options = this._options.map(option => ({
            ...option,
            selected: this.value.includes(option.value)
        }));
    }

    #onChange(event: UUISelectEvent) {
        const newValue = event.target.value;
        
        if (this._isMultiple) {
            this.value = Array.isArray(newValue) ? newValue as Array<string> : [newValue as string];
        } else {
            this.value = [newValue as string];
        }
        
        this.#updateOptionsSelection();
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    #onChangeMulitple(event: Event) {
        const select = event.target as HTMLSelectElement;
        const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
        this.value = selectedOptions;
        this.#updateOptionsSelection();
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    render() {
        if (this._isMultiple) {
            return this.#renderDropdownMultiple();
        }

        const currentValue = Array.isArray(this.value) ? this.value[0] : '';

        return html`
            <uui-select 
                .options=${this._options} 
                .value=${currentValue}
                ?disabled=${this.readonly}
                @change=${this.#onChange}>
            </uui-select>`;
    }

    #renderDropdownMultiple() {
        if (this.readonly) {
            return html`<div>${this.value?.join(', ')}</div>`;
        }

        return html`
            <select id="native" multiple @change=${this.#onChangeMulitple}>
                ${map(
                    this._options,
                    (item) => html`<option value=${item.value} ?selected=${item.selected}>${item.name}</option>`,
                )}
            </select>
        `;
    }

    static styles = [
        css`
            select {
                width: 100%;
                min-height: 120px;
            }
        `,
    ];
}

declare global {
    interface HTMLElementTagNameMap {
        'my-dropdown-editor': MyDropdownEditorElement;
    }
} 