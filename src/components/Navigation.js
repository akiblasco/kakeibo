import { useKakeibo } from '../context/KakeiboContext';

export function Navigation() {
  const { state, dispatch } = useKakeibo();

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'savings', label: 'Savings' },
  ];

  const handleNavigation = (section) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  return (
    <nav className="bg-white shadow fixed top-0 inset-x-0 z-50">
      <div className="container mx-auto p-4 flex justify-around">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleNavigation(section.id)}
            className={`px-4 py-2 ${
              state.activeSection === section.id
                ? 'font-bold text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
