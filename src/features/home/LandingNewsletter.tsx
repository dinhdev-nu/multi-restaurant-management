export default function LandingNewsletter() {
  return (
    <>
      <section className="py-14 md:py-[72px] flex flex-col items-center gap-10 relative bg-[--surface-secondary] !py-10 dark:bg-[--dark-surface-secondary]">
        <div className="container mx-auto flex flex-col gap-4 px-6 lg:flex-row lg:justify-between">
          <div className="flex flex-1 flex-col items-start gap-1">
            <h5 className="text-xl font-medium lg:text-2xl">
              Stay Ahead of the AI Curve
            </h5>
            <p className="text text-[--text-tertiary] dark:text-[--dark-text-tertiary] lg:text-lg">
              Join our newsletter for exclusive insights and updates on the latest
              AI trends.
            </p>
          </div>
          <form action="javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')">
            <div className="relative">
              <input
                className="h-9 w-full rounded-full border border-[--border] py-2 pl-4 pr-28 dark:border-[--dark-border] md:h-11 disabled:opacity-50 placeholder:text-sm placeholder:text-[--text-tertiary] dark:placeholder-[--dark-text-tertiary] text-sm text-[--text-primary] dark:text-[--dark-text-primary] outline-hidden focus-visible:ring-2 focus-visible:ring-[--control]"
                id="MTskZ6YnzTzluaWN1Nbuw"
                aria-label="Email"
                name="email"
                placeholder="john@gmail.com"
                required
                type="email"
                defaultValue=""
              />
              <button
                className="gap-1 font-normal shrink-0 rounded-full ring-[--control] focus-visible:ring-2 outline-hidden outline-0 bg-[--text-primary] text-[--surface-primary] dark:bg-[--dark-text-primary] dark:text-[--dark-surface-primary] border border-[--dark-border] dark:border-[--border] hover:bg-[--dark-surface-tertiary] dark:hover:bg-[--surface-tertiary] inline-flex items-center justify-center px-3.5 text-sm h-8 md:px-5 absolute right-1 top-1 !h-7 peer-disabled:opacity-50 md:right-1.5 md:top-1.5 md:!h-8"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}