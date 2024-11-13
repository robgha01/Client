# Guide: Creating an Umbraco Property Editor

This guide will walk you through creating a basic property editor in Umbraco. We'll create a simple text input editor to understand the core concepts.

## Key Components Required

1. **Property Editor UI Element**: The frontend component (TypeScript/Lit)
2. **Package Configuration**: Tells Umbraco about our editor
3. **Value Converter**: Converts stored data for use in templates (C#)
4. **Composer**: Registers our converter with Umbraco

## Step 1: Create the UI Element

First, create a TypeScript file for your editor component:

```typescript:src/my-text-editor.element.ts
import { css, customElement, html, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';

@customElement('my-text-editor')
export class MyTextEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    // Property to hold the editor value
    @property()
    public value?: string;

    // Property for readonly state
    @property({ type: Boolean, reflect: true })
    public readonly = false;

    render() {
        return html`
            <uui-input
                .value=${this.value ?? ''}
                ?readonly=${this.readonly}
                @change=${(event: Event) => {
                    this.value = (event.target as HTMLInputElement).value;
                    this.dispatchEvent(new UmbPropertyValueChangeEvent());
                }}>
            </uui-input>
        `;
    }

    static styles = css`
        :host {
            display: block;
        }
    `;
}

export default MyTextEditorElement;
```

## Step 2: Configure the Package

Create or update your package configuration:

```json:umbraco-package.json
{
    "$schema": "../../umbraco-package-schema.json",
    "name": "My.CustomEditors",
    "version": "0.1.0",
    "extensions": [
        {
            "type": "propertyEditorUi",
            "alias": "My.PropertyEditorUi.Text",
            "name": "My Text Editor",
            "element": "/App_Plugins/Client/mytext.js",
            "elementName": "my-text-editor",
            "meta": {
                "label": "Custom Text Editor",
                "icon": "icon-document",
                "group": "common",
                "propertyEditorSchemaAlias": "My.PropertyEditorUi.Text"
            }
        }
    ]
}
```

## Step 3: Create the Value Converter

Add a C# class to handle value conversion:

```csharp:ValueConverters/MyTextValueConverter.cs
public class MyTextValueConverter : PropertyValueConverterBase
{
    public override bool IsConverter(IPublishedPropertyType propertyType)
        => propertyType.EditorAlias.Equals("My.PropertyEditorUi.Text");

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(string);

    public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Element;

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview)
    {
        if (source == null) return null;
        return source.ToString();
    }
}
```

## Step 4: Register with Composer

Create or update your composer to register the converter:

```csharp:Composers/CustomEditorsComposer.cs
public class CustomEditorsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.PropertyValueConverters().Append<MyTextValueConverter>();
    }
}
```

## Step 5: Build Configuration

Update your Vite config to include the new editor:

```typescript:vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                mytext: "src/my-text-editor.element.ts"
            },
            formats: ["es"],
        },
        outDir: "../../wwwroot/App_Plugins/Client",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
    base: "/App_Plugins/Client/",
});
```

## Key Things to Remember

1. **Naming Conventions**:
   - Element names should be kebab-case
   - Aliases should be PascalCase with dots
   - Keep names consistent across all files

2. **Value Handling**:
   - Always dispatch `UmbPropertyValueChangeEvent` when value changes
   - Handle null/undefined values gracefully
   - Consider readonly state

3. **Component Structure**:
   - Extend `UmbLitElement`
   - Implement `UmbPropertyEditorUiElement`
   - Use Umbraco UI library components (uui-*)

4. **Build Process**:
   - Ensure all files are included in build config
   - Output to correct App_Plugins directory
   - Keep external Umbraco dependencies

## Using in Templates

Once your property editor is set up, you can use it in templates like this:

```csharp
@{
    var myText = Model.Value<string>("myTextPropertyAlias");
}

<div>
    <p>@myText</p>
</div>
```

## Common Issues and Solutions

1. **Editor Not Appearing**:
   - Check package configuration alias matches
   - Ensure build output is in correct location
   - Verify all imports are correct

2. **Value Not Saving**:
   - Verify `UmbPropertyValueChangeEvent` is being dispatched
   - Check value converter is registered
   - Ensure property alias matches in templates

3. **Build Errors**:
   - Check for missing dependencies
   - Verify TypeScript configuration
   - Ensure correct Umbraco UI library imports