class Report {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.creation_date = data.creation_date || new Date();
        
        this.date_range = data.date_range ? {
            start_date: data.date_range.start_date,
            end_date: data.date_range.end_date
        } : null;
        
        this.graphics = data.graphics || [];
        this.created_by = data.created_by;
        
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    validate() {
        if (!this.title) throw new Error("El título del reporte es requerido");
        if (!this.created_by) throw new Error("El creador del reporte (created_by) es requerido");
        
        if (this.date_range) {
            if (this.date_range.start_date && this.date_range.end_date) {
                if (new Date(this.date_range.start_date) > new Date(this.date_range.end_date)) {
                    throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin");
                }
            }
        }
    }
}

module.exports = Report;
