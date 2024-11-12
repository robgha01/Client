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
                                    style="min-height: 40px; min-width: 40px;"
                                    compact>
                                    <uui-icon name="icon-navigation"></uui-icon>
                                </uui-button>

                                <div class="item-content">
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
                                </div>

                                ${!this.readonly ? html`
                                    <uui-button
                                        compact
                                        look="secondary"
                                        color="danger"
                                        label="Remove"
                                        @click=${() => this.#removeItem(index)}>
                                        <uui-icon name="icon-trash"></uui-icon>
                                    </uui-button>
                                ` : ''}
                            </div>
                        `;
                    }
                )}

                ${!this.readonly ? html`
                    <div class="item">
                        <div></div>
                        <div class="add-item-container">
                            <uui-button
                                look="primary"
                                label="Add item"
                                @click=${this.#addItem}>
                                <uui-icon name="add"></uui-icon>
                                Add item
                            </uui-button>
                        </div>
                        <div></div>
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
        .items-container {
            display: flex;
            flex-direction: column;
            gap: var(--uui-size-space-2);
        }

        .item {
            display: grid;
            grid-template-columns: 40px 1fr 55.0278px;
            gap: var(--uui-size-space-3);
            background: var(--uui-color-surface);
            border-radius: var(--uui-border-radius);
            padding: var(--uui-size-space-3) 0;
        }

        .item-content {
            display: flex;
            gap: var(--uui-size-space-3);
            align-items: center;
            grid-column: 2;
        }

        uui-input {
            flex: 1;
            min-height: 40px;
        }

        /* Drag handle - first column */
        .drag-handle {
            grid-column: 1;
            cursor: move;
            color: var(--uui-color-text-alt);
            min-width: 40px;
            min-height: 40px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            align-self: start;
        }

        /* Remove button - last column */
        uui-button[label="Remove"] {
            grid-column: 3;
            width: 55.0278px;
            height: 40px;
            min-height: 40px;
            align-self: start;
        }

        /* Common button styles */
        .items-container uui-button {
            height: var(--uui-button-height);
            border: 1px solid var(--uui-color-border);
            border-radius: var(--uui-border-radius);
            transition: all 120ms ease;
        }

        /* Add item button */
        .add-item-container {
            grid-column: 2;
            display: flex;
            align-items: center;
        }

        .add-item-container uui-button {
            border-color: var(--uui-color-primary);
        }

        /* Draggable styles */
        .draggable-mirror {
            background: var(--uui-color-surface);
            border: 1px solid var(--uui-color-border-emphasis);
            border-radius: var(--uui-border-radius);
            padding: var(--uui-size-space-4);
            box-shadow: var(--uui-shadow-depth-3);
            opacity: 0.9;
        }

        .draggable-source--is-dragging {
            opacity: 0.3;
            border: 1px dashed var(--uui-color-border);
        }
    `;
}