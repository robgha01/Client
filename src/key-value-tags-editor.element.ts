import { css, customElement, html, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UmbTagsInputElement } from '@umbraco-cms/backoffice/tags';
import '@umbraco-cms/backoffice/tags';

interface KeyValueTagItem {
    title: string;
    key: string;
    tags: Array<string>;
}

@customElement('key-value-tags-editor')
export class KeyValueTagsEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value?: Array<KeyValueTagItem>;

    @property({ type: Boolean, reflect: true })
    readonly = false;

    @property()
    public config?: any;

    constructor() {
        super();
        this.value = [];
    }

    #onAdd() {
        this.value = [...(this.value ?? []), { title: '', key: '', tags: [] }];
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    #onRemove(index: number) {
        this.value = (this.value ?? []).filter((_, i) => i !== index);
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    #onKeyChange(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        this.value = (this.value ?? []).map((item, i) => 
            i === index ? { ...item, key: input.value } : item
        );
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    #onTagsChange(index: number, event: CustomEvent) {
        const tags = ((event.target as UmbTagsInputElement).value as string)
            .split(',')
            .filter(tag => tag.trim() !== '');
        
        this.value = (this.value ?? []).map((item, i) => 
            i === index ? { ...item, tags } : item
        );
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    #onTitleChange(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        this.value = (this.value ?? []).map((item, i) => 
            i === index ? { ...item, title: input.value } : item
        );
        this.dispatchEvent(new UmbPropertyValueChangeEvent());
    }

    render() {
        return html`
            <div class="key-value-tags">
                ${(this.value ?? []).map((item, index) => html`
                    <div class="key-value-tags__item">
                        <div class="key-value-tags__item-header">
                            <div class="key-value-tags__item-inputs">
                                <uui-input
                                    .value=${item.title}
                                    placeholder="Enter title"
                                    ?readonly=${this.readonly}
                                    @change=${(e: Event) => this.#onTitleChange(index, e)}
                                    style="min-height: 40px; padding: var(--uui-tag-padding, var(--uui-size-space-1, 3px) calc(var(--uui-size-space-1, 3px) + 0.5em)); padding-left: 0;">
                                </uui-input>

                                <uui-input
                                    .value=${item.key}
                                    placeholder="Enter key"
                                    ?readonly=${this.readonly}
                                    @change=${(e: Event) => this.#onKeyChange(index, e)}
                                    style="min-height: 40px; padding: var(--uui-tag-padding, var(--uui-size-space-1, 3px) calc(var(--uui-size-space-1, 3px) + 0.5em)); padding-left: 0;">
                                </uui-input>
                            </div>

                            ${!this.readonly ? html`
                                <uui-button
                                    compact
                                    look="secondary"
                                    color="danger"
                                    label="Remove"
                                    @click=${() => this.#onRemove(index)}
                                    style="min-height: 40px; min-width: 55.0278px;">
                                    <uui-icon name="icon-trash"></uui-icon>
                                </uui-button>
                            ` : ''}
                        </div>
                        
                        <umb-tags-input
                            .value=${item.tags.join(',')}
                            .items=${item.tags}
                            .config=${this.config}
                            ?readonly=${this.readonly}
                            @change=${(e: CustomEvent) => this.#onTagsChange(index, e)}>
                        </umb-tags-input>
                    </div>
                `)}

                ${!this.readonly ? html`
                    <div class="add-item-container">
                        <uui-button
                            look="primary"
                            label="Add item"
                            @click=${this.#onAdd}>
                            <uui-icon name="add"></uui-icon>
                            Add item
                        </uui-button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    static styles = [
        css`
            .key-value-tags {
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
            }

            .key-value-tags__item {
                background: var(--uui-color-surface);
                border-radius: var(--uui-border-radius);
                padding: var(--uui-size-space-3);
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
                padding-left: 0;
            }

            .key-value-tags__item-header {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: var(--uui-size-space-3);
                align-items: center;
            }

            .key-value-tags__item-inputs {
                display: flex;
                gap: var(--uui-size-space-3);
                border-left: 2px solid var(--uui-color-border);
            }

            /* Common button styles - matching input height */
            .key-value-tags uui-button {
                height: var(--uui-button-height);
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                transition: all 120ms ease;
            }

            /* Remove button */
            uui-button[label="Remove"] {
                width: var(--uui-button-height);
            }

            /* Add item button */
            .add-item-container uui-button {
                border-color: var(--uui-color-primary);
            }

            .add-item-container uui-button:hover {
                background: var(--uui-color-primary-emphasis);
                border-color: var(--uui-color-primary-emphasis);
                color: var(--uui-color-surface);
            }

            /* Make inputs equal width */
            .key-value-tags__item-inputs uui-input {
                flex: 1;
            }

            /* Tags input full width */
            umb-tags-input {
                width: 100%;
                border-left: 2px solid var(--uui-color-border);
            }
        `
    ];
}

export default KeyValueTagsEditorElement;

declare global {
    interface HTMLElementTagNameMap {
        'key-value-tags-editor': KeyValueTagsEditorElement;
    }
} 