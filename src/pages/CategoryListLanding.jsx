import { useEffect, useState } from 'react';
import { api, url } from '../axios';
import { useNavigate } from 'react-router-dom';

export default function CategoriesLayout() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/api/landingCategories').then((res) => {
      setCategories(res.data);
    });
  }, []);

  // 🔥 pattern: 4 → 3 → 4 → 3 ...
  const buildRows = (items) => {
    const rows = [];
    let i = 0;
    let isFour = true;

    while (i < items.length) {
      const size = isFour ? 4 : 3;
      rows.push({
        type: size,
        items: items.slice(i, i + size),
      });
      i += size;
      isFour = !isFour;
    }

    return rows;
  };

  const rows = buildRows(categories);

  return (
    <div className="md:mx-56 mx-2">
      {rows.map((row, index) => {
        // 🔥 4-column row (full width)
        if (row.type === 4) {
          return (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4"
            >
              {row.items.map((cat) => (
                <Card key={cat.id} cat={cat} />
              ))}
            </div>
          );
        }

        return (
          <div
            key={index}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 w-full sm:w-9/12 mx-auto"
          >
            {row.items.map((cat) => (
              <Card key={cat.id} cat={cat} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Card({ cat }) {
  const img = cat.images?.[0]?.url;
  const src = `${url}/storage/${img}`;
  const navigate = useNavigate();

  return (
    <div onClick={() => {
      navigate(`/category/${cat.id}`);
    }} className="border rounded-md cursor-pointer p-2 flex flex-col items-center justify-center shadow hover:shadow-md transition">
      {src && (
        <img
          src={src}
          alt={cat.name}
          className="w-full h-36 object-cover rounded"
        />
      )}
      <p className="mt-2 font-medium text-center">{cat.name}</p>
    </div>
  );
}