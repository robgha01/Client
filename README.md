# Key Value Tags Editor for Umbraco 14

![image](https://github.com/user-attachments/assets/289862ba-00c2-4b08-b868-97f5d26ff6ee)

A custom property editor for Umbraco 14 that allows editors to manage key-value pairs with associated tags. Each item consists of a title, key, and multiple tags, with drag-and-drop reordering capabilities.

## Features

- Title and Key inputs for each item
- Tag management using Umbraco's native tag input
- Drag and drop reordering
- Add/Remove items
- Fully responsive design
- Follows Umbraco UI/UX patterns
- Compatible with readonly mode
- Built using Umbraco's UI library components

## Project Structure

- `/src`: Contains the source code for the Key Value Tags Editor.
  - `/DataEditors`: Contains the data editor components.
    - `KeyValueTagsDataEditor.cs`: The main data editor class that registers the property editor with Umbraco.
  - `/ValueConverters`: Contains the value converters.
    - `KeyValueTagsValueConverter.cs`: Converts the stored JSON data to strongly typed objects.
    - `KeyValueTagItem.cs`: Model class representing each item in the editor.
- `/App_Plugins`: Contains the Umbraco App Plugins.
  - `/KeyValueTags`: The property editor's front-end files.
    - `/src`: TypeScript source files.
      - `key-value-tags-editor.element.ts`: Main web component for the editor UI.
      - `key-value-tags-input.element.ts`: Input component for the editor.
      - `key-value-tags-list.element.ts`: List component for the editor.
    - `key-value-tags-editor.html`: HTML template file.

## Components

### Backend Components

#### Data Editor

```csharp
[DataEditor(
    alias: "keyValueTags",
    name: "Key Value Tags",
    view: "/App_Plugins/KeyValueTags/key-value-tags-editor.html",
    Group = Constants.PropertyEditors.Groups.Lists,
    Icon = "icon-tags")]
public class KeyValueTagsDataEditor : DataEditor
{
    private readonly IIOHelper _ioHelper;
    private readonly IEditorConfigurationParser _editorConfigurationParser;

    public KeyValueTagsDataEditor(
        IDataValueEditorFactory dataValueEditorFactory,
        IIOHelper ioHelper,
        IEditorConfigurationParser editorConfigurationParser)
        : base(dataValueEditorFactory)
    {
        _ioHelper = ioHelper;
        _editorConfigurationParser = editorConfigurationParser;
    }
}
```

#### Value Converter

```csharp
public class KeyValueTagsValueConverter : PropertyValueConverterBase
{
    public override bool IsConverter(IPublishedPropertyType propertyType)
        => propertyType.EditorAlias.Equals("keyValueTags");

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(IEnumerable<KeyValueTagItem>);

    public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Element;

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview)
    {
        if (source == null) return null;
        var sourceString = source.ToString();
        if (string.IsNullOrWhiteSpace(sourceString)) return Enumerable.Empty<KeyValueTagItem>();
        try
        {
            return JsonConvert.DeserializeObject<IEnumerable<KeyValueTagItem>>(sourceString);
        }
        catch (Exception ex)
        {
            return Enumerable.Empty<KeyValueTagItem>();
        }
    }
}
```

#### Model

```csharp
public class KeyValueTagItem
{
    public string Title { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public IEnumerable<string> Tags { get; set; } = Enumerable.Empty<string>();
}
```

### Frontend Components

#### Main Editor Component

```typescript
@customElement('key-value-tags-editor')
export class KeyValueTagsEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value?: Array<KeyValueTagItem>;

    @property({ type: Object })
    public config: any;

    @state()
    private _items: Array<KeyValueTagItem> = [];
}
```

#### Input Component

```typescript
@customElement('key-value-tags-input')
export class KeyValueTagsInputElement extends UmbLitElement {
    @property({ type: String })
    public value?: string;

    @property({ type: String })
    public placeholder?: string;

    @property({ type: Boolean })
    public readonly = false;
}
```

#### List Component

```typescript
@customElement('key-value-tags-list')
export class KeyValueTagsListElement extends UmbLitElement {
    @property({ type: Array })
    public items?: Array<KeyValueTagItem>;

    @property({ type: Boolean })
    public readonly = false;
}
```

## Usage

### Example Value Format

```json
[
    {
        "title": "Category One",
        "key": "category1",
        "tags": ["tag1", "tag2", "tag3"]
    },
    {
        "title": "Category Two",
        "key": "category2",
        "tags": ["tag4", "tag5"]
    }
]
```

### Using in Templates

```csharp
@using UmbracoProject1.ValueConverters

@{
    var keyValueTags = Model.Value<IEnumerable<KeyValueTagItem>>("propertyAlias");
}

@foreach (var item in keyValueTags)
{
    <h3>@item.Title</h3>
    <p>Key: @item.Key</p>
    <ul>
        @foreach (var tag in item.Tags)
        {
            <li>@tag</li>
        }
    </ul>
}
```

## Configuration

The property editor supports the following configuration options:

- **Tag Group**: Specify a group name for the tags
- **Storage Type**: Define how tags should be stored

## License

MIT License - See [LICENSE.md](LICENSE.md) for details.
