"use client";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [hidePremineRows, setHidePremineRows] = useState(true);

  // useEffect does not directly support async/await, so we define an async function inside it
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/runes`,
          {
            headers: {
              "Content-Type": "application/json",
              // Include other necessary headers
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Fetching data failed:", error);
      }
    }

    fetchData();
  }, []); // The empty array means this effect runs once on mount

  const togglePremineVisibility = () => {
    setHidePremineRows(!hidePremineRows);
  };

  const renderLargeNumber = (supply: string) => {
    const num = parseInt(supply);
    if (isNaN(num)) return "-";

    const formatNumber = (value: number, divisor: number, suffix: string) => {
      let formatted = (value / divisor).toFixed(1); // Format with one decimal place
      // Remove ".0" if it ends with it to avoid showing unnecessary zeros
      if (formatted.endsWith(".0")) {
        formatted = formatted.substring(0, formatted.length - 2);
      }
      return `${formatted}${suffix}`;
    };

    if (num >= 10000000000000000000000000000) {
      return "∞";
    }

    if (num >= 1000000000000) {
      return formatNumber(num, 1000000000000, "T");
    }

    if (num >= 1000000000) {
      return formatNumber(num, 1000000000, "B");
    }

    if (num >= 1000000) {
      return formatNumber(num, 1000000, "M");
    }

    if (num >= 1000) {
      return formatNumber(num, 1000, "K");
    }

    return num.toString(); // Return the number as a string for consistency
  };

  // const renderPercentMinted = (supply: number, cap: number) => {
  //   if (!supply) return "-";
  //   if (!cap) return "-";

  //   let percent = 0;

  //   percent = (supply / cap) * 100;

  //   if (percent < 0.0) return percent.toFixed(0) + "%";
  //   if (percent < 1) return percent.toFixed(2) + "%";
  //   return percent.toFixed(0) + "%";
  // };

  // console.log(JSON.stringify(data, null, 2));

  return (
    <div className="flex-1 w-full flex flex-col items-center pb-8 px-4">
      <div className="mt-6 flex flex-row gap-2 items-center justify-center">
        <Logo />
        <div className="text-sm">(signet)</div>
      </div>

      <div className="w-full overflow-x-auto mt-6">
        <table className="min-w-full divide-y table-auto text-center">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Rune</th>{" "}
              <th className="px-4 py-2">Per mint</th>
              <th className="px-4 py-2">Circulating Supply</th>
              <th className="px-4 py-2">Max Supply</th>
              <th className="px-4 py-2">
                Premine{" "}
                <span
                  style={{ cursor: "pointer" }}
                  onClick={togglePremineVisibility}
                >
                  {hidePremineRows ? "👀" : "🚫"}
                </span>
              </th>
              {/* <th className="px-4 py-2">Divisibility</th> */}
              <th className="px-4 py-2">Mintable</th>
            </tr>
          </thead>
          <tbody>
            {data?.data
              ?.filter((item: any) => !hidePremineRows || item.premine <= 0)
              .map((item: any, index: number) => (
                <tr key={index}>
                  {/* Name */}
                  <td className="text-left px-4 py-2 flex flex-row items-center">
                    <div className="bg-[#494366] w-[40px] p-1 items-center flex justify-center mr-4 rounded">
                      <span>#{item.number}</span>
                    </div>

                    <div className="w-[50px] flex items-center justify-center text">
                      <span className="text-3xl">{item.symbol}</span>
                    </div>

                    <span className="ml-2">{item.title}</span>
                  </td>
                  {/* Mint Amount */}
                  <td className="px-4 py-2">
                    {renderLargeNumber(item.amount)}
                  </td>
                  {/* Circulating Supply */}
                  <td className="px-4 py-2">
                    {renderLargeNumber((item.mints * item.amount).toString())}
                  </td>
                  {/* Item Supply */}
                  <td className="px-4 py-2">
                    {renderLargeNumber(item.supply)}
                  </td>
                  {/* Premine */}
                  <td className="px-4 py-2">
                    {renderLargeNumber(item.premine > 0 ? item.premine : "-")}
                  </td>
                  {/* Divisibility */}
                  {/* <td className="px-4 py-2">{item.divisibility}</td> */}
                  {/* Mintable */}
                  <td className="px-4 py-2">
                    {item.mintable === "true" ? "🟩" : "🟥"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
