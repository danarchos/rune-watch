async function getData() {
  const res = await fetch("http://localhost:3000/runes");
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function Page() {
  const data = await getData();

  const renderLargeNumber = (supply: string) => {
    const num = parseInt(supply);
    if (isNaN(num)) return "-";

    if (num >= 10000000000000000000000000000) {
      return "∞";
    }

    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(0)}T`;
    }

    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(0)}B`;
    }

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)}M`;
    }

    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }

    return num;
  };

  // console.log(JSON.stringify(data, null, 2));
  return (
    <div className="flex-1 w-full flex flex-col gap-0 items-center pb-8">
      <h1 className={`text-4xl m-8`}>Rune Watch</h1>
      <table className="divide-y table-auto text-center">
        <thead>
          <tr>
            <th className="text-left px-4 py-2">Name</th>{" "}
            <th className="px-4 py-2">Number</th>
            <th className="px-4 py-2">Block</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">End</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Mints</th>
            <th className="px-4 py-2">Cap</th>
            <th className="px-4 py-2">Remaining</th>
            <th className="px-4 py-2">Mintable</th>
            <th className="px-4 py-2">Supply</th>
            <th className="px-4 py-2">Premine</th>
            <th className="px-4 py-2">Burned</th>
            <th className="px-4 py-2">Divisibility</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item: any, index: number) => (
            <tr key={index}>
              <td className="text-left px-4 py-2 flex flex-row items-center">
                <div className="w-[50px]">
                  <span className="text-4xl">{item.symbol}</span>
                </div>

                {item.title}
              </td>
              <td className="px-4 py-2">{item.number}</td>
              <td className="px-4 py-2">{item.etching_block}</td>
              <td className="px-4 py-2">
                {item.start === "none" ? "-" : item.start}
              </td>
              <td className="px-4 py-2">{item.end}</td>
              <td className="px-4 py-2">{item.amount}</td>
              <td className="px-4 py-2">{item.mints}</td>
              <td className="px-4 py-2">{renderLargeNumber(item.cap)}</td>
              <td className="px-4 py-2">{renderLargeNumber(item.remaining)}</td>
              <td className="px-4 py-2">{item.mintable}</td>
              <td className="px-4 py-2">{renderLargeNumber(item.supply)}</td>
              <td className="px-4 py-2">{renderLargeNumber(item.premine)}</td>
              <td className="px-4 py-2">{item.burned}</td>
              <td className="px-4 py-2">{item.divisibility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
