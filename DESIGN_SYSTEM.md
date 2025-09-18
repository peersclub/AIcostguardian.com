# AI Cost Guardian - Glass Morphism Design System

## 🎨 **CRITICAL: Design Standards**

**ALL UI components MUST follow this glass morphism design system. NO EXCEPTIONS.**

---

## 📐 **Core Design Principles**

### **1. Glass Morphism Containers**
```css
/* Main Modals/Cards */
bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl

/* Secondary Containers */
bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700

/* Form Fields */
bg-gray-800/50 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20
```

### **2. Typography Hierarchy**
```css
/* Primary Text */
text-white

/* Secondary Text */
text-gray-400

/* Value/Data Text */
text-indigo-400

/* Muted Text */
text-gray-500
```

### **3. Interactive Elements**

#### **Buttons**
```css
/* Primary Button */
bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white

/* Secondary Button */
bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-gray-300 hover:text-white

/* Tab Active */
bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg

/* Tab Inactive */
text-gray-400 hover:text-white hover:bg-gray-700/50
```

#### **Form Controls**
```css
/* Input/Select/Textarea */
bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400
focus:border-indigo-500 focus:ring-indigo-500/20

/* Select Content */
bg-gray-800 border-gray-600

/* Select Items */
text-white hover:bg-gray-700 focus:bg-gray-700
```

### **4. Layout Structure**
```css
/* Modal Container */
fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4

/* Modal Content */
w-full max-w-4xl h-[85vh] flex flex-col bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl

/* Scrollable Content */
flex-1 overflow-y-auto
```

---

## 🚫 **NEVER USE These Classes**

```css
/* ❌ FORBIDDEN - Breaks glass morphism */
bg-white
bg-gray-100
bg-gray-200
bg-gray-300
text-black
text-gray-800
text-gray-900

/* ❌ FORBIDDEN - Non-glass backgrounds */
bg-blue-500
bg-red-500
bg-green-500
bg-yellow-500
```

---

## ✅ **Required Component Structure**

### **Modal Template**
```jsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">

    {/* Header - Fixed */}
    <div className="border-b border-gray-700 p-6 flex-shrink-0">
      <h2 className="text-xl font-semibold text-white">Title</h2>
      <p className="text-sm text-gray-400">Description</p>
    </div>

    {/* Content - Scrollable */}
    <div className="flex-1 overflow-y-auto p-6">
      {/* Content here */}
    </div>

    {/* Footer - Fixed */}
    <div className="border-t border-gray-700 p-6 flex-shrink-0">
      {/* Action buttons */}
    </div>

  </div>
</div>
```

### **Form Field Template**
```jsx
<div className="space-y-2">
  <Label className="text-white">Label Text</Label>
  <Input
    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
    placeholder="Placeholder text..."
  />
</div>
```

### **Tab Navigation Template**
```jsx
<div className="grid w-full grid-cols-4 m-6 mb-0 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-1">
  <button className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
    active
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
  }`}>
    <Icon className="h-4 w-4" />
    Tab Label
  </button>
</div>
```

---

## 🎯 **Form Field Order Standards**

### **Provider/Model Selection**
```
1. Provider (FIRST)
2. Model (SECOND - depends on provider)
```

### **AI Configuration**
```
1. Provider
2. Model
3. Temperature
4. Max Tokens
5. Context Window
```

---

## 📝 **Implementation Checklist**

When creating ANY UI component:

- [ ] ✅ Uses glass morphism backgrounds (`bg-gray-900/50 backdrop-blur-xl`)
- [ ] ✅ White text for primary content (`text-white`)
- [ ] ✅ Gray-400 for secondary content (`text-gray-400`)
- [ ] ✅ Indigo accent colors (`text-indigo-400`, `border-indigo-500`)
- [ ] ✅ Proper border colors (`border-gray-700`, `border-gray-600`)
- [ ] ✅ Consistent hover states (`hover:bg-gray-700/50`)
- [ ] ✅ Proper focus states (`focus:border-indigo-500`)
- [ ] ✅ Flex layouts for proper spacing
- [ ] ✅ Proper provider/model order
- [ ] ✅ No hardcoded colors that break glass morphism

---

## 🔧 **Claude Instructions**

**ALWAYS reference this design system when creating UI components. Follow these patterns EXACTLY - no deviations allowed.**

**For any modal/form/component:**
1. Start with glass morphism container
2. Use white text for primary content
3. Use gray-400 for secondary content
4. Use indigo accents for interactive elements
5. Follow the exact CSS classes provided above
6. Test that it matches the existing dashboard aesthetic

**NEVER:**
- Use bright solid colors
- Use white/light backgrounds
- Break the glass morphism aesthetic
- Put model before provider

---

*Last Updated: 2025-09-18*
*This design system ensures consistency across the entire AI Cost Guardian application.*