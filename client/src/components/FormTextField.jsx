export function FormTextField ({ name, required }) {
  return (
    <section className='flex flex-col gap-1'>
        <section>
            <label htmlFor='username'>{name}</label>
            {
                required &&
                     <span>*</span>
            }
        </section>
        <input
            className='p-1 outline-none border-b border-black bg-inherit focus:border-ui-blue'
            type="text"
            name={name.toLowerCase()}
            required={required}
        />
    </section>
  )
}
