import {useParams} from "react-router-dom";

export default function NoteDetail() {
  const {id} = useParams();
  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold">Note Detail</h1>
      <p>Note ID: {id}</p>
      <p>This is a placeholder detail page for the note.</p>
    </div>
  );
}
