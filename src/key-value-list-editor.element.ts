import { css, customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUIInputEvent } from '@umbraco-cms/backoffice/external/uui';
import { UmbSorterController, UmbSorterConfig } from '@umbraco-cms/backoffice/sorter';
import { repeat } from '@umbraco-cms/backoffice/external/lit';

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

    private static generateUniqueId(item: KeyValueItem): string {
        // Remove spaces and special characters, convert to lowercase
        const key = item.key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const value = item.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `${key}_${value}`;
    }

    // Define sorter config separately
    private static SORTER_CONFIG: UmbSorterConfig<KeyValueItem, HTMLElement> = {
        itemSelector: '.item-container',
        containerSelector: '.items-container',
        getUniqueOfElement: (element) => {
            const id = element.getAttribute('data-item-id');
            console.log('getUniqueOfElement', id);
            return id || '';
        },
        getUniqueOfModel: (item) => {
            const id = KeyValueListEditorElement.generateUniqueId(item);
            console.log('getUniqueOfModel', id);
            return id;
        }
    };

    // Initialize sorter with config
    #sorter = new UmbSorterController<KeyValueItem, HTMLElement>(this, {
        ...KeyValueListEditorElement.SORTER_CONFIG,
        onChange: ({ model }) => {
            const oldValue = this._items;
            this._items = [...model];
            this.requestUpdate('_items', oldValue);
            this.dispatchChange();
        },
    });

    @property({ type: Boolean, reflect: true })
    public get readonly() {
        return this.#readonly;
    }
    public set readonly(value: boolean) {
        this.#readonly = value;
        if (this.#readonly) {
            this.#sorter.disable();
        } else {
            this.#sorter.enable();
        }
    }
    #readonly = false;

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.value && this.value.length > 0) {
            this._items = [...this.value];
            this.#sorter.setModel(this._items);
        }
    }

    willUpdate(changedProperties: Map<string, any>) {
        super.willUpdate(changedProperties);
        
        if (changedProperties.has('value') && this.value) {
            this._items = [...this.value];
            this.#sorter.setModel(this._items);
        }
    }

    #addItem() {
        const newItems = [
            ...this._items,
            { key: '', value: '', isDefault: false }
        ];
        this._items = newItems;
        this.#sorter.setModel(newItems);
        this.dispatchChange();
    }

    #removeItem(index: number) {
        const newItems = this._items.filter((_, i) => i !== index);
        this._items = newItems;
        this.#sorter.setModel(newItems);
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
                <div class="items-container sorter-container">
                    ${repeat(
                        this._items,
                        (item) => KeyValueListEditorElement.generateUniqueId(item),
                        (item, index) => {
                            const itemId = KeyValueListEditorElement.generateUniqueId(item);
                            return html`
                                <div 
                                    class="item-container flex gap-2 items-center mb-2"
                                    id="${itemId}"
                                    data-item-id="${itemId}"
                                    ?disabled=${this.readonly}>
                                    <uui-button 
                                        class="drag-handle"
                                        label="Drag to reorder"
                                        compact>
                                        <uui-icon name="icon-navigation"></uui-icon>
                                    </uui-button>

                                    <uui-input
                                        label="Key"
                                        .value=${item.key}
                                        placeholder="Enter key"
                                        @input=${(e: UUIInputEvent) => 
                                            this.#updateItem(index, 'key', e.target.value as string)}>
                                    </uui-input>
                                    
                                    <uui-input
                                        label="Value"
                                        .value=${item.value}
                                        placeholder="Enter value"
                                        @input=${(e: UUIInputEvent) => 
                                            this.#updateItem(index, 'value', e.target.value as string)}>
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
                            `;
                        }
                    )}
                </div>

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

    static styles = [
        css`
            .item-container {
                cursor: default;
                background: var(--uui-color-surface);
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                padding: var(--uui-size-space-2);
            }

            .drag-handle {
                cursor: move;
            }

            /* Draggable styles */
            .draggable-mirror {
                background: var(--uui-color-surface);
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                padding: var(--uui-size-space-2);
                opacity: 0.8;
            }

            .draggable-source--is-dragging {
                opacity: 0.4;
            }
        `,
    ];
}

export default KeyValueListEditorElement;

declare global {
    interface HTMLElementTagNameMap {
        'key-value-list-editor': KeyValueListEditorElement;
    }
} 