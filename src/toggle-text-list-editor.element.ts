import { css, customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import { UmbSorterController, UmbSorterConfig } from '@umbraco-cms/backoffice/sorter';
import { repeat } from '@umbraco-cms/backoffice/external/lit';

interface ToggleTextItem {
    text: string;
    isEnabled: boolean;
}

@customElement('toggle-text-list-editor')
export class ToggleTextListEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value?: Array<ToggleTextItem>;

    @state()
    private _items: Array<ToggleTextItem> = [];

    private static generateUniqueId(item: ToggleTextItem): string {
        return `${item.text.toLowerCase().replace(/[^a-z0-9]/g, '')}_${item.isEnabled}`;
    }

    private static SORTER_CONFIG: UmbSorterConfig<ToggleTextItem, HTMLElement> = {
        itemSelector: '.item',
        containerSelector: '.items-container',
        getUniqueOfElement: (element) => {
            const id = element.getAttribute('data-item-id');
            return id || '';
        },
        getUniqueOfModel: (item) => {
            return ToggleTextListEditorElement.generateUniqueId(item);
        }
    };

    #sorter = new UmbSorterController<ToggleTextItem, HTMLElement>(this, {
        ...ToggleTextListEditorElement.SORTER_CONFIG,
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

    render() {
        return html`
            <div class="flex flex-col">
                <div class="items-container">
                    ${repeat(
                        this._items,
                        (item) => ToggleTextListEditorElement.generateUniqueId(item),
                        (item, index) => {
                            const itemId = ToggleTextListEditorElement.generateUniqueId(item);
                            return html`
                                <div 
                                    class="item"
                                    id="${itemId}"
                                    data-item-id="${itemId}"
                                    ?disabled=${this.readonly}>
                                    <uui-button 
                                        class="drag-handle"
                                        label="Drag to reorder"
                                        tabindex="-1"
                                        compact>
                                        <uui-icon name="icon-navigation"></uui-icon>
                                    </uui-button>

                                    <uui-input
                                        .value=${item.text}
                                        placeholder="Enter text"
                                        ?readonly=${this.readonly}
                                        @change=${(e: Event) => 
                                            this.#updateText(index, (e.target as HTMLInputElement).value)}>
                                    </uui-input>

                                    <uui-toggle
                                        .checked=${item.isEnabled}
                                        ?disabled=${this.readonly}
                                        @change=${() => this.#toggleEnabled(index)}>
                                    </uui-toggle>

                                    ${!this.readonly ? html`
                                        <uui-button
                                            label="Remove"
                                            color="danger"
                                            @click=${() => this.#removeItem(index)}>
                                            <uui-icon name="icon-trash"></uui-icon>
                                        </uui-button>
                                    ` : ''}
                                </div>
                            `;
                        }
                    )}
                </div>

                ${!this.readonly ? html`
                    <div class="add-item-container">
                        <uui-button
                            label="Add item"
                            look="primary"
                            @click=${this.#addItem}>
                            Add Item
                        </uui-button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    #addItem() {
        const newItems = [
            ...this._items,
            { text: '', isEnabled: false }
        ];
        this._items = newItems;
        this.#sorter.setModel(newItems);
        this.dispatchChange();
        this.#focusNewItem();
    }

    async #focusNewItem() {
        await this.updateComplete;
        const items = this.shadowRoot?.querySelectorAll('uui-input');
        if (items) {
            const lastItem = items[items.length - 1];
            lastItem?.focus();
        }
    }

    #removeItem(index: number) {
        const newItems = this._items.filter((_, i) => i !== index);
        this._items = newItems;
        this.#sorter.setModel(newItems);
        this.dispatchChange();
    }

    #updateText(index: number, newValue: string) {
        this._items = this._items.map((item, i) => 
            i === index 
                ? { ...item, text: newValue }
                : item
        );
        
        this.requestUpdate();
        this.dispatchChange();
    }

    #toggleEnabled(index: number) {
        this._items = this._items.map((item, i) => 
            i === index 
                ? { ...item, isEnabled: !item.isEnabled }
                : item
        );
        this.dispatchChange();
    }

    private dispatchChange() {
        this.value = this._items;
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    static styles = css`
        .item {
            display: flex;
            gap: var(--uui-size-space-2);
            align-items: center;
            padding: var(--uui-size-space-2);
        }
        
        .add-button {
            padding: var(--uui-size-space-2);
        }
        
        uui-input {
            flex: 1;
        }
    `;
}