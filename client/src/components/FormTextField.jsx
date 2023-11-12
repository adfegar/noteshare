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
            type="text"
            name={name.toLowerCase()}
            className='p-1 outline-none border-b border-black bg-inherit focus:border-ui-blue'
        />
    </section>
  )
}
