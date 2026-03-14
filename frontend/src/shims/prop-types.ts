// Lightweight shim used only to satisfy imports in the browser.
// The real runtime validation from `prop-types` is not needed here.
// We return a validator function that is also available as `.isRequired`,
// and any property access on the PropTypes object returns that validator.

type Validator = ((...args: any[]) => Validator) & { isRequired: Validator }

const baseValidator = ((..._args: any[]) => baseValidator) as Validator
baseValidator.isRequired = baseValidator

const PropTypesShim = new Proxy(
  {},
  {
    get: () => baseValidator
  }
) as Record<string, Validator>

export default PropTypesShim

