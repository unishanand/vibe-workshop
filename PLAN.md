# Kanban Board Project Plan

## Phase 1: Core Card Functionality
- [x] Implement functionality to add new cards.
    - [x] UI for creating a card (e.g., a modal or inline form).
    - [x] Input field for card title/description.
    - [x] "Add Card" button.
    - [x] Store card data (initially, this could be in-memory).
- [x] Implement functionality to edit existing cards.
    - [x] UI for editing a card.
    - [x] Ability to change card title/description.
    - [x] "Save Changes" button.
- [x] Implement functionality to delete cards.
    - [x] "Delete Card" button or icon.
    - [x] Confirmation before deletion.

## Phase 2: Core Column Functionality & Card Movement
- [x] Implement functionality to create new columns.
    - [x] UI for adding a column (e.g., an "Add Column" button).
    - [x] Input field for column name.
    - [x] Store column data.
    - [x] Display new columns on the board.
- [x] Implement functionality to move cards between columns.
    - [x] Drag-and-drop interface for cards.
    - [x] Update card data to reflect its new column.

## Phase 3: Advanced Column Functionality
- [x] Implement functionality to edit existing column titles.
    - [x] UI for editing a column title.
    - [x] "Save Changes" button for column title. // Implemented via onBlur and Enter key
- [x] Implement functionality to delete columns.
    - [x] "Delete Column" button or icon.
    - [x] Confirmation before deletion.
    - [x] Decide how to handle cards in a deleted column (e.g., move to a default column or delete them). // Cards are deleted with the column

## Phase 4: Card Labeling
- [x] Implement functionality to add labels to cards.
    - [x] UI for selecting or creating labels (e.g., a dropdown or tag input). // Implemented as comma-separated text input
    - [x] Ability to assign multiple labels to a card.
    - [x] Display labels on cards.
    - [x] Store label data and association with cards.

## Phase 5: UI/UX Enhancements & Product Team Usability
- [x] **Prioritize Board Visibility**: Move the Kanban board display to the top of the page, making it the first thing users see.
- [x] **Collapsible Forms**:
    - [x] Make the "Add New Card" form collapsible and minimized by default. Users can expand it when needed.
    - [x] Make the "Add New Column" form collapsible and minimized by default. Users can expand it when needed.
- [ ] **Intuitive Card and Column Management**:
    - [ ] Consider context menus (e.g., right-click on a card or column) for quick actions like edit, delete, add label.
    - [ ] Allow reordering of columns via drag and drop.
- [ ] **Visual Cues and Feedback**:
    - [ ] Enhance drag-and-drop visuals (e.g., clear visual indication of where a card will be dropped).
    - [ ] Use icons more consistently for actions (edit, delete, add, etc.) to make the interface more compact.
    - [ ] Allow users to assign colors to labels or cards for better visual organization (e.g., red for bugs, green for features).
- [ ] **Filtering and Searching**:
    - [ ] Implement a search bar to quickly find cards by title or description.
    - [ ] Add functionality to filter cards by labels.
- [ ] **User-Specific Views/Preferences (Advanced)**:
    - [ ] Explore options for saving user-specific views or preferences (e.g., collapsed columns, filters).
- [ ] **Mobile Responsiveness**:
    - [ ] Further review and improve the layout and usability on smaller screens to ensure product team members can use it on the go.