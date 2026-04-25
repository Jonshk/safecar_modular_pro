# Pega esto al FINAL de backend/app/routers/training.py

@router.delete("/admin/modules/{module_id}", status_code=204)
def delete_module(module_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM training_modules WHERE id = ?", (module_id,))
    conn.commit()
    conn.close()