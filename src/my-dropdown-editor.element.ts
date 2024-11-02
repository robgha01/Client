import { customElement, property, html, LitElement } from "@umbraco-cms/backoffice/external/lit";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/extension-registry";
import type { UmbPropertyEditorConfigCollection } from "@umbraco-cms/backoffice/property-editor";

@customElement('my-dropdown-editor')
export class MyDropdownEditorElement extends LitElement implements UmbPropertyEditorUiElement {
    
    @property({ attribute: false })
    config?: UmbPropertyEditorConfigCollection;

    @property()
    value?: string;

    render() {
        const items = this.config?.getValueByAlias('items') as Array<{key: string, value: string}> || [];
        const defaultValue = this.config?.getValueByAlias('defaultValue') as string;

        if (items.length === 0) return null;

        return html`
            <uui-select
                .value=${this.value ?? defaultValue ?? ''}
                .options=${items.map(item => ({
                    name: item.value,
                    value: item.key
                }))}
                @change=${(event: CustomEvent) => {
                    this.value = event.detail.value;
                    this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
                }}
            ></uui-select>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'my-dropdown-editor': MyDropdownEditorElement;
    }
} 