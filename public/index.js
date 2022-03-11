const exerciseForm = document.querySelector('#exercise-form')

exerciseForm.addEventListener('submit', () => {
   const userId = document.querySelector('#uid').value
   exerciseForm.action = `/api/users/${userId}/exercises`
   exerciseForm.submit()
})