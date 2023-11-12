export function FormPasswordField ({ required }) {
  return (
    <section className='flex flex-col gap-1'>
        <section>
            <label htmlFor='username'>Password</label>
            {
                required &&
                     <span>*</span>
            }
        </section>
        <input
            type="password"
            name="password"
            className='p-1 outline-none border-b border-black bg-inherit focus:border-ui-blue'
        />
    </section>
  )
}
