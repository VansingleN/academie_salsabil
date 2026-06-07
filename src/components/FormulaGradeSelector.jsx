import './FormulaGradeSelector.css'

function FormulaGradeSelector({ grades, activeGrade, onChange, ariaLabel }) {
  return (
    <div className="formula-grade-selector" role="group" aria-label={ariaLabel}>
      <span className="formula-grade-selector-label">Choisir la classe</span>
      <div className="formula-grade-selector-options">
        {grades.map((grade) => (
          <button
            type="button"
            key={grade.id}
            aria-pressed={activeGrade === grade.id}
            className={activeGrade === grade.id ? 'formula-grade-option formula-grade-option--active' : 'formula-grade-option'}
            onClick={() => onChange(grade.id)}
          >
            {grade.formulaLabel ?? grade.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FormulaGradeSelector
