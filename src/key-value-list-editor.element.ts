import { customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';

interface KeyValueItem {
    key: string;
    value: string;
    isDefault?: boolean;
}

@customElement('key-value-list-editor')
export class KeyValueListEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    value: Array<KeyValueItem> = [];

    @state()
    private _items: Array<KeyValueItem> = [];

    connectedCallback() {
        super.connectedCallback();
        if (this.value && this.value.length > 0) {
            this._items = this.value;
        }
    }

    #addItem() {
        this._items = [
            ...this._items,
            { key: '', value: '', isDefault: false }
        ];
        this.dispatchChange();
    }

    #removeItem(index: number) {
        this._items = this._items.filter((_, i) => i !== index);
        this.dispatchChange();
    }

    #updateItem(index: number, field: 'key' | 'value', newValue: string) {
        this._items = this._items.map((item, i) => 
            i === index ? { ...item, [field]: newValue } : item
        );
        this.dispatchChange();
    }

    #setDefault(index: number) {
        this._items = this._items.map((item, i) => ({
            ...item,
            isDefault: i === index
        }));
        this.dispatchChange();
    }

    private dispatchChange() {
        this.value = this._items;
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    render() {
        return html`
            <div class="flex flex-col gap-2">
                ${this._items.map((item, index) => html`
                    <div class="flex gap-2 items-center">
                        <uui-input
                            label="Key"
                            .value=${item.key}
                            @change=${(e: CustomEvent) => 
                                this.#updateItem(index, 'key', (e.target as HTMLInputElement).value)}>
                        </uui-input>
                        
                        <uui-input
                            label="Value"
                            .value=${item.value}
                            @change=${(e: CustomEvent) => 
                                this.#updateItem(index, 'value', (e.target as HTMLInputElement).value)}>
                        </uui-input>

                        <uui-button
                            label="Set as default"
                            color=${item.isDefault ? 'positive' : 'default'}
                            @click=${() => this.#setDefault(index)}>
                            ${item.isDefault ? 'Default' : 'Set Default'}
                        </uui-button>

                        <uui-button
                            label="Remove"
                            color="danger"
                            @click=${() => this.#removeItem(index)}>
                            <uui-icon name="icon-trash"></uui-icon>
                        </uui-button>
                    </div>
                `)}

                <div>
                    <uui-button
                        label="Add item"
                        look="primary"
                        @click=${this.#addItem}>
                        Add Item
                    </uui-button>
                </div>
            </div>
        `;
    }
}

export default KeyValueListEditorElement;

declare global {
    interface HTMLElementTagNameMap {
        'key-value-list-editor': KeyValueListEditorElement;
    }
} 