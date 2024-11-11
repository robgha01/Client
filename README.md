# Key Value Tags Editor for Umbraco 14

A custom property editor for Umbraco 14 that allows editors to manage key-value pairs with associated tags. Each item consists of a title, key, and multiple tags, with drag-and-drop reordering capabilities.

![image](https://github.com/user-attachments/assets/289862ba-00c2-4b08-b868-97f5d26ff6ee)

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

- `/src`: Contains the source code for the editors.
  - `key-value-list-editor.element.ts`: Editor for managing key-value pairs with default selection
  - `key-value-tags-editor.element.ts`: Editor for managing key-value pairs with tags
  - `my-dropdown-editor.element.ts`: Custom dropdown editor with single/multiple selection
- `/wwwroot/App_Plugins/Client`: Contains the compiled editor files.
  - `client.js`: Dropdown editor
  - `keyvaluelist.js`: Key value list editor
  - `keyvaluetags.js`: Key value tags editor

## Components

### Backend Components

#### Composer

```csharp
public class CustomEditorsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.PropertyValueConverters().Append<KeyValueTagsValueConverter>();
        builder.PropertyValueConverters().Append<KeyValueListValueConverter>();
    }
}
```

#### Value Converters

```csharp
public class KeyValueTagsValueConverter : PropertyValueConverterBase
{
    public override bool IsConverter(IPublishedPropertyType propertyType)
        => propertyType.EditorAlias.Equals("My.PropertyEditorUi.KeyValueTags");

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

public class KeyValueListValueConverter : PropertyValueConverterBase
{
    public override bool IsConverter(IPublishedPropertyType propertyType)
        => propertyType.EditorAlias.Equals("My.PropertyEditorUi.KeyValueList");

    public override Type GetPropertyValueType(IPublishedPropertyType propertyType)
        => typeof(IEnumerable<KeyValueItem>);

    public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType)
        => PropertyCacheLevel.Element;

    public override object? ConvertSourceToIntermediate(IPublishedElement owner, IPublishedPropertyType propertyType, object? source, bool preview)
    {
        if (source == null) return null;
        var sourceString = source.ToString();
        if (string.IsNullOrWhiteSpace(sourceString)) return Enumerable.Empty<KeyValueItem>();
        try
        {
            return JsonConvert.DeserializeObject<IEnumerable<KeyValueItem>>(sourceString);
        }
        catch (Exception ex)
        {
            return Enumerable.Empty<KeyValueItem>();
        }
    }
}
```

#### Models

```csharp
public class KeyValueTagItem
{
    public string Title { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public IEnumerable<string> Tags { get; set; } = Enumerable.Empty<string>();
}

public class KeyValueItem
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
```

#### Data Editors

```csharp
[DataEditor(
    alias: "My.PropertyEditorUi.KeyValueTags",
    type: EditorType.PropertyValue,
    ValueEditorIsReusable = true)]
public class KeyValueTagsDataEditor : DataEditor
{
    public KeyValueTagsDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }

    protected override IDataValueEditor CreateValueEditor()
        => DataValueEditorFactory.Create<KeyValueTagsDataValueEditor>(Attribute!);
}

public class KeyValueTagsDataValueEditor : DataValueEditor
{
    public KeyValueTagsDataValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
    {
    }
}

[DataEditor(
    alias: "My.PropertyEditorUi.KeyValueList",
    type: EditorType.PropertyValue,
    ValueEditorIsReusable = true)]
public class KeyValueListDataEditor : DataEditor
{
    public KeyValueListDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }

    protected override IDataValueEditor CreateValueEditor()
        => DataValueEditorFactory.Create<KeyValueListDataValueEditor>(Attribute!);
}

public class KeyValueListDataValueEditor : DataValueEditor
{
    public KeyValueListDataValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
    {
    }
}

[DataEditor(
    alias: "My.PropertyEditorUi.Dropdown",
    type: EditorType.PropertyValue,
    ValueEditorIsReusable = true)]
public class CustomDropdownDataEditor : DataEditor
{
    public CustomDropdownDataEditor(IDataValueEditorFactory dataValueEditorFactory)
        : base(dataValueEditorFactory)
    {
    }

    protected override IDataValueEditor CreateValueEditor()
        => DataValueEditorFactory.Create<CustomDropdownDataValueEditor>(Attribute!);
}

public class CustomDropdownDataValueEditor : DataValueEditor
{
    public CustomDropdownDataValueEditor(
        IShortStringHelper shortStringHelper,
        IJsonSerializer jsonSerializer,
        IIOHelper ioHelper,
        DataEditorAttribute attribute)
        : base(shortStringHelper, jsonSerializer, ioHelper, attribute)
    {
    }
}
```

### Frontend Components

#### Key Value Tags Editor

```typescript
@customElement('key-value-tags-editor')
export class KeyValueTagsEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value?: Array<KeyValueTagItem>;

    @property({ type: Object })
    public config: any;

    interface KeyValueTagItem {
        title: string;
        key: string;
        tags: Array<string>;
    }
}
```

#### Key Value List Editor

```typescript
@customElement('key-value-list-editor')
export class KeyValueListEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    value: Array<KeyValueItem> = [];

    interface KeyValueItem {
        key: string;
        value: string;
        isDefault?: boolean;
    }
}
```

#### Custom Dropdown Editor
```typescript
@customElement('my-dropdown-editor')
export class MyDropdownEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
    @property({ type: Array })
    public value: Array<string> = [];

    // Always returns array, even for single selection
    // Single selection: ["selected-value"]
    // Multiple selection: ["value1", "value2", "value3"]
}
```

## Usage

### Example Value Formats

#### Key Value Tags
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

#### Key Value List
```json
[
    {
        "key": "option1",
        "value": "Option 1",
        "isDefault": true
    },
    {
        "key": "option2",
        "value": "Option 2",
        "isDefault": false
    }
]
```

#### Custom Dropdown
```json
// Single selection (still returns array)
["selected-value"]

// Multiple selection
["value1", "value2", "value3"]
```

### Using in Templates

```csharp
@using UmbracoProject1.ValueConverters

@{
    // Key Value Tags
    var keyValueTags = Model.Value<IEnumerable<KeyValueTagItem>>("keyValueTagsAlias");
    
    // Key Value List
    var keyValueList = Model.Value<IEnumerable<KeyValueItem>>("keyValueListAlias");
    
    // Custom Dropdown (always returns IEnumerable<string>)
    var dropdownValues = Model.Value<IEnumerable<string>>("dropdownAlias");
}

// Example: Key Value Tags
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

// Example: Key Value List
@foreach (var item in keyValueList)
{
    <div class="@(item.IsDefault ? "default" : "")">
        <span>@item.Value</span>
        <code>@item.Key</code>
    </div>
}

// Example: Custom Dropdown
<ul>
    @foreach (var value in dropdownValues)
    {
        <li>@value</li>
    }
</ul>
```

## Configuration

The property editor supports the following configuration options:

- **Tag Group**: Specify a group name for the tags
- **Storage Type**: Define how tags should be stored

## License

MIT License - See [LICENSE.md](LICENSE.md) for details.
